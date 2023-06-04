import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../DataBase/Firebase';

const Login = () => {
  const [id, setID] = useState('');
  const [pw, setPW] = useState('');

  const navigation = useNavigation();

  const login = async () => {
    try {
      const snapshot = await db.collection('User').get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const user = users.find(u => u.ID === id && u.PASSWORD === pw);

      if (user) {
        alert('로그인 성공');
        setID('');
        setPW('');
        navigation.navigate('TabNavigator'); // 로그인 성공 시 탭 네비게이션으로 이동
      } else {
        alert('ID 또는 비밀번호가 잘못되었습니다.');
        setPW('');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const signUp = async () => {
  try {
    setID('');
    setPW('');

    navigation.navigate('SignUp');
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
      <TouchableOpacity style={styles.loginBtn} onPress={login}>
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupBtn} onPress={signUp}>
        <Text style={styles.signupText}>회원가입</Text>
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
  loginBtn: {
    width: '75%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    marginBottom: 10,
  },
  loginText: {
    color: 'black',
    fontWeight: 'bold',
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

export default Login;