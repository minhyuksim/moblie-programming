import {Image} from 'react-native'

const TabBarIcon = (focused,name) =>{
  let iconImagePath;
  
  if(name==="TodoList"){
    iconImagePath = require('../assets/check.png')
  }
  else if(name==="Calendar"){
    iconImagePath = require('../assets/calendar.png')
  }else if(name==="Chatbot"){
    iconImagePath = require('../assets/chatbot.png')
  }

  return(
    <Image style = {{
      width: focused ? 24:20,
      height: focused ? 24:20
    }}
    source = {iconImagePath}
    />
  )
}

export default TabBarIcon