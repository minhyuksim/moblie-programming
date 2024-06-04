import sys
import re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from konlpy.tag import Okt
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pymongo import MongoClient
from bson import ObjectId
import jwt
from google.cloud import speech
from google.cloud import storage
import gridfs
import subprocess
import librosa
import joblib
from Hate_catch.hate_catch import detect_hate_speech_in_sentences, tokenize

# 현재 디렉터리를 PYTHONPATH에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 벡터라이저와 모델 로드
model2 = joblib.load('Hate_catch/UPhate_speech_ensemble_model.pkl')
vectorizer2 = joblib.load('Hate_catch/UPtfidf_vectorizer.pkl')
vectorizer2.tokenizer = tokenize

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB 연결 설정
mongo_url = "mongodb+srv://ckdgml1302:admin@cluster0.cw4wxud.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(mongo_url)
db = client.get_database('test')
recordings_collection = db['recordings']
fs = gridfs.GridFS(db, collection='recordings')

# 환경 변수 설정
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\sunmoon\Downloads\sttproject-422705-57026631f62c.json"
GCS_BUCKET_NAME = 'sttproject3'

# JWT 비밀 키
SECRET_KEY = 'your_secret_key'

def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded['userId']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print("Token verification failed:", str(e))
        return None

def convert_audio(input_data, input_format='m4a', output_format='wav', sample_rate=16000):
    input_file = "input." + input_format
    output_file = "output." + output_format
    with open(input_file, 'wb') as f:
        f.write(input_data)
    subprocess.run(['ffmpeg', '-i', input_file, '-ar', str(sample_rate), '-ac', '1', output_file], check=True)
    with open(output_file, 'rb') as f:
        output_data = f.read()
    os.remove(input_file)
    os.remove(output_file)
    return output_data

def upload_to_gcs(file_path, bucket_name, destination_blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file_path)
    return f"gs://{bucket_name}/{destination_blob_name}"

def analyze_speech_rate(audio_file_path):
    y, sr = librosa.load(audio_file_path)
    duration = librosa.get_duration(y=y, sr=sr)
    words = librosa.effects.split(y, top_db=20)
    word_count = len(words)
    speech_rate = word_count / duration
    ideal_rate = 160 / 60  # words per second
    if (speech_rate < ideal_rate * 0.8):
        score = "느린 속도"
    elif (speech_rate > ideal_rate * 1.2):
        score = "빠른 속도"
    else:
        score = "적당한 속도"
    return speech_rate, score

def calculate_silence_durations(transcription_response):
    silence_durations = []
    prev_end_time = None
    prev_word = None

    for result in transcription_response.results:
        for word_info in result.alternatives[0].words:
            start_time = word_info.start_time.total_seconds()
            end_time = word_info.end_time.total_seconds()
            if prev_end_time is None:
                prev_word = word_info.word
                prev_end_time = end_time
                continue
            silence_duration = start_time - prev_end_time
            if silence_duration >= 1.5:
                silence_durations.append((prev_word, word_info.word, silence_duration))
            prev_word = word_info.word
            prev_end_time = end_time
    return silence_durations

def extract_keywords(transcript):
    pattern = r'\b(응|음|아|어)\b'
    regex_words = re.findall(pattern, transcript)
    regex_word_counts = Counter(regex_words)
    words = re.findall(r'\b\w+\b', transcript)
    normal_words = [word for word in words if word not in regex_words]
    normal_word_counts = Counter({word: count for word, count in Counter(normal_words).items() if count >= 3})
    okt = Okt()
    nouns = okt.nouns(transcript)
    nouns_joined = ' '.join(nouns)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([nouns_joined])
    tfidf_scores = tfidf_matrix.toarray().flatten()
    tfidf_dict = {word: score for word, score in zip(vectorizer.get_feature_names_out(), tfidf_scores)}
    sorted_tfidf = sorted(tfidf_dict.items(), key=lambda item: item[1], reverse=True)
    top_keywords = [word for word, score in sorted_tfidf[:5]]
    return regex_word_counts, normal_word_counts, top_keywords

@app.route('/recordings/<file_id>/transcript', methods=['GET'])
def get_transcript(file_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Authorization header missing'}), 403
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401

    try:
        recording_file = fs.find_one({'_id': ObjectId(file_id)})
        if not recording_file:
            return jsonify({'error': 'Recording file not found'}), 404
        recording_metadata = recordings_collection.find_one({'fileId': ObjectId(file_id), 'userId': ObjectId(user_id)})
        if not recording_metadata:
            return jsonify({'error': 'Recording metadata not found'}), 404
        audio_data = recording_file.read()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    try:
        converted_audio = convert_audio(audio_data, input_format='m4a', output_format='wav', sample_rate=16000)
        with open("temp.wav", "wb") as f:
            f.write(converted_audio)
        gcs_uri = upload_to_gcs("temp.wav", GCS_BUCKET_NAME, f"{file_id}.wav")
        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(uri=gcs_uri)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="ko-KR",
            enable_word_time_offsets=True  # 단어 타임스탬프 활성화
        )
        operation = client.long_running_recognize(config=config, audio=audio)
        response = operation.result(timeout=300)
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript
        speech_rate, speed_score = analyze_speech_rate("temp.wav")
        hate_speech_results = detect_hate_speech_in_sentences(transcript, model2, vectorizer2)
        silence_durations = calculate_silence_durations(response)
        print("Silence Durations Returned: ", silence_durations)
        regex_word_counts, normal_word_counts, top_keywords = extract_keywords(transcript)

        recordings_collection.update_one(
            {'_id': ObjectId(recording_metadata['_id'])},
            {'$set': {
                'transcript': transcript,
                'hate_speech_results': hate_speech_results,
                'silence_durations': silence_durations,
                'top_keywords': top_keywords,
                'regex_word_counts': regex_word_counts,  # 추가
                'normal_word_counts': normal_word_counts  # 추가
            }}
        )
        os.remove("temp.wav")

        return jsonify({
            'transcript': transcript,
            'speech_rate': speech_rate,
            'speed_score': speed_score,
            'hate_speech_results': hate_speech_results,
            'silence_durations': silence_durations,
            'top_keywords': top_keywords,
            'regex_word_counts': regex_word_counts,  # 추가
            'normal_word_counts': normal_word_counts  # 추가
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
