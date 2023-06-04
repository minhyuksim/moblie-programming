import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../DataBase/Firebase';

const SignUp = () => {
  const [id, setID] = useState('');
  const [pw, setPW] = useState('');

const navigation = useNavigation();

  const signUp = async () => {
    try {
      // 데이터베이스에 ID와 PASSWORD 저장
      await db.collection('User').add({
        ID: id,
        PASSWORD: pw,
      });

      // 회원가입 성공 메시지 출력 또는 다른 작업 수행
      alert('회원가입 성공');
      navigation.navigate('Login');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputTT}
        placeholder="아이디"
        value={id}
        onChangeText={setID}
      />
      <TextInput
        style={styles.inputTT}
        placeholder="비밀번호"
        secureTextEntry
        value={pw}
        onChangeText={setPW}
      />
      <TouchableOpacity style={styles.signupBtn} onPress={signUp}>
        <Text style={styles.signupText}>등록</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'skyblue',
  },
  inputTT: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '75%',
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  signupBtn: {
    width: '75%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
  },
  signupText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default SignUp;