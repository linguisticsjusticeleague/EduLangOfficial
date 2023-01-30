import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {Strings} from '../../CommonFeatures/Strings';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Input,
  Pressable,
  Stack,
  Text,
  FormControl,
  Select,
} from 'native-base';

import logo from '../../assets/images/RealEduLangLogo.png';
import i18n from '../../Locale';
import {useTranslation} from 'react-i18next';
import {
  createUser,
  loginEmailPassword,
  setUserInfo,
} from '../../CommonFeatures/Services/StorageUtils/UserStorage';
import {useIsFocused} from '@react-navigation/native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useKeyboardShow} from '../../CommonFeatures/Services/hooks/useKeyboardShow';
import {LanguageSelector} from '../../Components/LanguageSelector';
import CustomButton from '../../Components/CustomeButton';
const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const FormLogin = ({navigation}) => {
  const [show, setShow] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailErrorMsg, setEmailErrorMsg] = React.useState('');
  const [isInvalid, setIsInvalid] = React.useState(false);

  function loginUser() {
    if (email === '') {
      setIsInvalid(true);
      setEmailErrorMsg('Enter your email address');
      setPasswordErrorMsg('');
      return;
    }
    if (password === '') {
      setIsInvalid(true);
      setEmailErrorMsg('');
      setPasswordErrorMsg('Enter your password');
      return;
    }

    loginEmailPassword(email, password)
      .then(() => {
        setIsInvalid(false);
        i18n.changeLanguage('en');
        navigation.replace('Tabs');
      })
      .catch(error => {
        // if we can't login, then notify the user the problem
        setIsInvalid(true);
        switch (error) {
          case 'auth/wrong-password':
            setPasswordErrorMsg('Incorrect password');
            setEmailErrorMsg('');
            break;
          case 'auth/invalid-email':
            setPasswordErrorMsg('');
            setEmailErrorMsg('Invalid Email');
            break;
          case 'auth/user-not-found':
            setEmailErrorMsg('User not found.');
            setPasswordErrorMsg('');
            break;
          default:
            setEmailErrorMsg('');
            setPasswordErrorMsg('Error Message: ' + error);
            break;
        }
      });
  }

  return (
    <Stack space={4} w="100%" alignItems="center">
      <Stack>
        <FormControl isInvalid={isInvalid} isRequired>
          <FormControl.Label>Email</FormControl.Label>
          <Input
            w={{
              base: '75%',
              md: '25%',
            }}
            InputLeftElement={
              <Icon
                as={<MaterialIcons name="person" />}
                size={5}
                ml="2"
                color="muted.400"
              />
            }
            placeholder="Email"
            onChangeText={text => setEmail(text)}
          />
          <FormControl.ErrorMessage
            display={emailErrorMsg === '' ? 'none' : undefined}
            leftIcon={<Ionicons name="alert-circle-outline" />}
          >
            {emailErrorMsg}
          </FormControl.ErrorMessage>
          <FormControl.Label>Password</FormControl.Label>
          <Input
            w={{
              base: '75%',
              md: '25%',
            }}
            onChangeText={text => setPassword(text)}
            type={show ? 'text' : 'password'}
            InputRightElement={
              <Pressable onPress={() => setShow(!show)}>
                <Icon
                  as={
                    <MaterialIcons
                      name={show ? 'visibility' : 'visibility-off'}
                    />
                  }
                  size={5}
                  mr="2"
                  color="muted.400"
                />
              </Pressable>
            }
            placeholder="Password"
          />
          <FormControl.ErrorMessage
            display={passwordErrorMsg === '' ? 'none' : undefined}
            leftIcon={<Ionicons name="alert-circle-outline" />}
          >
            {passwordErrorMsg}
          </FormControl.ErrorMessage>
        </FormControl>
        <CustomButton
          style={{marginTop: 20}}
          title="Login"
          onPress={loginUser}
        />
      </Stack>
    </Stack>
  );
};
const FormRegister = ({navigation}) => {
  const [show, setShow] = React.useState(false);
  const [grade, setGrade] = React.useState(-1);
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [translatedLanguage, setTranslatedLanguage] = React.useState('');
  const [originalLanguage, setOriginalLanguage] = React.useState('');

  async function registerUser() {
    setErrorMsg('');
    // notify user that message
    if (username === '') {
      setErrorMsg('Please enter a username!');
      return;
    }
    if (email === '') {
      setErrorMsg('Please enter a email!');
      return;
    }
    if (grade === -1) {
      setErrorMsg('Please select a grade!');
      return;
    }
    if (originalLanguage === '') {
      setErrorMsg('Please select an original language!');
      return;
    }
    if (translatedLanguage === '') {
      setErrorMsg('Please select a translated language!');
      return;
    }
    if (translatedLanguage === originalLanguage) {
      setErrorMsg(
        'Your translated language cannot be equal to your original language!'
      );
      return;
    }
    if (password === '') {
      setErrorMsg('Please enter a password!');
      return;
    }

    await createUser(email, password)
      .catch(err => {
        switch (err) {
          case 'auth/email-already-in-use':
            setErrorMsg('Email address already in use.');
            break;
          case 'auth/invalid-email':
            setErrorMsg('Email address is invalid.');
            break;
          case 'auth/weak-password':
            setErrorMsg('Password is not strong enough.');
            break;
          default:
            setErrorMsg('Unknown error with error code ' + err?.code);
            break;
        }
      })
      .then(async () => {
        await setUserInfo(
          originalLanguage,
          translatedLanguage,
          grade,
          username
        );
        navigation.navigate('Tabs');
      });
  }

  return (
    <Stack w="100%" alignItems="center">
      <Stack>
        <FormControl isInvalid isRequired>
          <Stack space={2.5} w="100%">
            <Input
              w={{
                base: '75%',
                md: '25%',
              }}
              InputLeftElement={
                <Icon
                  as={<MaterialIcons name="person" />}
                  size={5}
                  ml="2"
                  color="muted.400"
                />
              }
              placeholder="Username"
              onChangeText={setUsername}
            />
            <Input
              w={{
                base: '75%',
                md: '25%',
              }}
              InputLeftElement={
                <Icon
                  as={<MaterialIcons name="person" />}
                  size={5}
                  ml="2"
                  color="muted.400"
                />
              }
              placeholder="Email"
              onChangeText={setEmail}
            />
            <Select
              w={{
                base: '100%',
              }}
              InputLeftElement={
                <Icon
                  as={<MaterialIcons name="person" />}
                  size={5}
                  ml="2"
                  color="muted.400"
                />
              }
              placeholder="Grade"
              onValueChange={value => setGrade(value)}
            >
              <Select.Item label="Grade 1" value={1} />
              <Select.Item label="Grade 2" value={2} />
              <Select.Item label="Grade 3" value={3} />
              <Select.Item label="Grade 4" value={4} />
              <Select.Item label="Grade 5" value={5} />
            </Select>
            <LanguageSelector
              placeholder="Original Language"
              onValueChange={setOriginalLanguage}
            />
            <LanguageSelector
              placeholder="Translated Language"
              onValueChange={setTranslatedLanguage}
            />

            <Input
              w={{
                base: '75%',
                md: '25%',
              }}
              type={show ? 'text' : 'password'}
              InputRightElement={
                <Pressable onPress={() => setShow(!show)}>
                  <Icon
                    as={
                      <MaterialIcons
                        name={show ? 'visibility' : 'visibility-off'}
                      />
                    }
                    size={5}
                    mr="2"
                    color="muted.400"
                  />
                </Pressable>
              }
              placeholder="Password"
              onChangeText={setPassword}
            />
            <FormControl.ErrorMessage
              w="75%"
              display={errorMsg === '' ? 'none' : undefined}
            >
              {errorMsg}
            </FormControl.ErrorMessage>
            <CustomButton title="Register" onPress={registerUser} />
          </Stack>
        </FormControl>
      </Stack>
    </Stack>
  );
};

const Home = ({navigation, route}) => {
  const {t} = useTranslation();
  // Decides which form to show
  const [formSelected, setFormSelected] = useState(null);
  const isFocused = useIsFocused();
  // Allows animation
  const imagePosition = useSharedValue(1);
  const formPosition = useSharedValue(1);
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(
      imagePosition.value,
      [0.01, 1],
      [-HEIGHT / 1.5, 0]
    );
    return {
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}],
    };
  });
  // helps detect if keyboard is display
  const isKeyboardVisible = useKeyboardShow();
  useEffect(() => {
    if (isKeyboardVisible) {
      if (formSelected === 'login') {
        formPosition.value = -0.3;
      } else {
        formPosition.value = -0.45;
      }
    } else {
      formPosition.value = 1;
    }
  }, [isKeyboardVisible]);

  // helps move everything up when keyboard is display
  const keyboardAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(
      formPosition.value,
      [0, 1],
      [-HEIGHT / 4, 0]
    );
    return {
      transform: [{translateY: withTiming(interpolation, {duration: 400})}],
    };
  });
  // toggles Animatin
  const animatedBottonsStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [255, 0]);
    return {
      opacity: withTiming(imagePosition.value, {duration: 500}),
      transform: [{translateY: withTiming(interpolation, {duration: 1000})}],
    };
  });
  const closeBottonStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [180, 360]);
    return {
      opacity: withTiming(imagePosition.value === 1 ? 0 : 1, {duration: 800}),
      transform: [
        {rotate: withTiming(interpolation + 'deg', {duration: 1000})},
      ],
      marginBottom: 10,
    };
  });
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        imagePosition.value === 0
          ? withDelay(400, withTiming(1, {duration: 800}))
          : withTiming(0, {duration: 300}),
    };
  });
  const showFormsLoginHandler = () => {
    setFormSelected('login');
    imagePosition.value = 0;
  };
  const showFormsRegisterHandler = () => {
    setFormSelected('register');
    imagePosition.value = 0;
  };
  const exitHandler = () => {
    imagePosition.value = 1;
    // setFormSelected(null);
  };

  // useEffect(async () => {
  //   // Set local variables
  //   await Storage.setItem({
  //     key: 'data',
  //     value: '[]',
  //   });
  //   await Storage.setItem({
  //     key: 'titles',
  //     value: '[]',
  //   });
  //   await Storage.setItem({
  //     key: 'favBooks',
  //     value: '[]',
  //   });
  //   await Storage.setItem({
  //     key: 'completedBooks',
  //     value: '[]',
  //   });
  // }, [isFocused]);

  // useEffect(() => {
  //   const onRenderFunc = async () => {
  //     // Set local variables
  //     await Storage.setItem({
  //       key: 'data',
  //       value: '[]',
  //     });
  //     await Storage.setItem({
  //       key: 'titles',
  //       value: '[]',
  //     });
  //     await Storage.setItem({
  //       key: 'favBooks',
  //       value: '[]',
  //     });
  //     await Storage.setItem({
  //       key: 'completedBooks',
  //       value: '[]',
  //     });
  //   };
  //   onRenderFunc();
  // }, [isFocused]);
  console.log(
    '🚀 ~ file: Home.js:503 ~ Home ~ Strings.Auth.login',
    Strings.Auth.login
  );

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
          <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
            <Box>
              <Image
                resizeMode="cover"
                style={{height: HEIGHT * 0.2, width: WIDTH}}
                source={require('../../assets/wave1.png')}
              />
              <Center>
                <HStack>
                  <Heading size="xl" color="#93CB54">
                    Edu
                  </Heading>
                  <Heading size="xl" color="#4CA4D3">
                    Lang
                  </Heading>
                </HStack>

                <Image source={logo} style={styles.logo} />
                <Heading size="sm" color="#4CA4D3">
                  {Strings.appQuote}
                </Heading>
              </Center>
            </Box>
          </Animated.View>

          <Animated.View style={[animatedBottonsStyle, styles.buttons]}>
            <CustomButton
              title={Strings.Auth.login}
              onPress={showFormsLoginHandler}
            />
          </Animated.View>
          <Animated.View style={[animatedBottonsStyle, styles.buttons]}>
            <CustomButton title="Register" onPress={showFormsRegisterHandler} />
          </Animated.View>

          <Center
            top={HEIGHT * (formSelected === 'register' ? 0.29 : 0.37)}
            alignSelf="center"
          >
            <Animated.View style={keyboardAnimatedStyle}>
              <Animated.View style={closeBottonStyle}>
                <CustomButton
                  icon={
                    <MaterialIcons
                      name="close"
                      color="white"
                      style={{fontSize: 22}}
                    />
                  }
                  type="icon"
                  onPress={exitHandler}
                />
              </Animated.View>
              <Animated.View style={formAnimatedStyle}>
                <Box
                  zIndex={-1}
                  width={WIDTH}
                  height={HEIGHT}
                  borderTopRadius="100"
                  bg="gray.100"
                  pt="1/6"
                >
                  {formSelected === 'login' && (
                    <FormLogin navigation={navigation} />
                  )}
                  {formSelected === 'register' && (
                    <FormRegister navigation={navigation} />
                  )}
                </Box>
              </Animated.View>
            </Animated.View>
          </Center>
        </>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#d1fae5',
  },
  keyboardContainer: {
    zIndex: -1,
  },

  buttons: {
    zIndex: 2,
    alignSelf: 'center',
    top: HEIGHT * 0.75,
    paddingTop: 20,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  // backgroundContainer: {
  //   flex: 1,
  //   width: null,
  //   height: null,
  //   alignItems: "center",
  //   //justifyContent: 'center',
  // },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  logoText: {
    // color: COLORS.darkCoral,
    zIndex: 2,
    fontSize: 40,
    // paddingVertical: 5,
    // fontWeight: "500",
    // fontFamily: "Inter-V",
  },
});
