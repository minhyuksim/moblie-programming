import {useState} from 'react';
import {StyleSheet,Text,TextInput,View,Button} from 'react-native'

const Chatbot = () =>{
  const [text,setText] = useState('')
  const [response, setResponse] = useState ('')

  const generateText = async () =>{
    const prompt = text;
    const apiKey = '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'
    const url = 'https://api.openai.com/v1/engines/text-davinci-003/completions'

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
    const data={
      prompt:prompt,
      max_tokens:1024,
      temperature:0.7,
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
    const result = await response.json()
    setResponse(result.choices[0].text)
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenAI text Generation</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your text prompt here"
        value={text}
        onChangeText={(value)=>setText(value)}
      />
      <Button title="Generate Text" onPress={generateText}/>
      <Text style={styles.response}>{response}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#fff',
    paddingHorizontal:20,
  },
  title:{
    fontSize: 24,
    fontWeight:'bold',
    marginBottom:20,
  },
  input:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:5,
    padding:10,
    marginBotton:20,
    width:'100%',
    fontSize:16,
  },
  response:{
    marginTop:20,
    fontSize:16,
    textAlign:'center',
  },
})

export default Chatbot