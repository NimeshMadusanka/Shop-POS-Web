import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';

// utils
import axios from '../utils/axios';

//
import { isValidToken, setSession } from './utils';
import { ActionMapType, AuthStateType, AuthUserType, JWTContextType } from './types';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  SIGNUP = 'SIGNUP',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.SIGNUP]: {
    user: AuthUserType;
    company?: any;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.SIGNUP) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = await localStorage.getItem('accessToken');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const response = await axios.get(`user/client-validate-user`);

        const user = response.data;

        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  // const login = useCallback(async (email: string, password: string) => {
  //   const response = await axios.post('/user/login', {
  //     email,
  //     password,
  //   });

  //   const { accessToken, user, uploadSettings } = response.data;

  //   if (accessToken) {
  //     localStorage.setItem('accessToken', accessToken);
  //     localStorage.setItem('userdetails', JSON.stringify(user));
  //     localStorage.setItem('userId', user._id);

  //     localStorage.setItem('uploadSettings', JSON.stringify(uploadSettings));
  //     axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
  //   }

  //   dispatch({
  //     type: Types.LOGIN,
  //     payload: {
  //       user,
  //     },
  //   });
  // }, []);

  const login = useCallback(async (email: string, password: string) => {
  const response = await axios.post('/user/login', { email, password });

  const { accessToken } = response.data;

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Fetch full user data from client-validate-user
  const userResponse = await axios.get('user/client-validate-user');
  const user = userResponse.data;

  localStorage.setItem('userdetails', JSON.stringify(user));
  localStorage.setItem('userId', user._id);

  dispatch({
    type: Types.LOGIN,
    payload: { user },
  });
}, []);

  // PIN LOGIN for cashiers
  const loginPin = useCallback(async (email: string, pin: string) => {
    const response = await axios.post('/user/login-pin', { email, pin });

    const { accessToken } = response.data;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Fetch full user data from client-validate-user
    const userResponse = await axios.get('user/client-validate-user');
    const user = userResponse.data;

    localStorage.setItem('userdetails', JSON.stringify(user));
    localStorage.setItem('userId', user._id);

    dispatch({
      type: Types.LOGIN,
      payload: { user },
    });
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phoneNumber: string,
      companyID: string,
      type: string,
      role: string,
      admin: boolean
    ) => {
      const response = await axios.post('/user/client-signup', {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        companyID,
        type,
        role,
        admin,
      });

      const { accessToken, user, uploadSettings } = response.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('uploadSettings', JSON.stringify(uploadSettings));
        axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
      }
      dispatch({
        type: Types.SIGNUP,
        payload: {
          user,
        },
      });
    },
    []
  );

  const Signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      phoneNumber: string,
      email: string,
      password: string,
      companyID: string,
      companyName: string,
      regNo: string,
      industry: string,
      role: string,
      // employee:boolean,
      userId: string
    ) => {
      const response = await axios.put(`/user/employee-signup/${userId}`, {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        companyID,
        companyName,
        regNo,
        industry,
        // employee,
        role,
        userId,
      });

      const { accessToken, user, company, uploadSettings } = response.data;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('uploadSettings', JSON.stringify(uploadSettings));
        axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
      }
      dispatch({
        type: Types.SIGNUP,
        payload: {
          user,
          company,
        },
      });
    },
    []
  );

  // REGISTER
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      mobileNumber: string,
      companyId: string
    ) => {
      const response = await axios.post('/company-user/register', {
        email,
        password,
        firstName,
        lastName,
        mobileNumber,
        companyId,
        role: 'admin',
      });
      const { accessToken, user } = response.data;

      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
        axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
      }

      dispatch({
        type: Types.REGISTER,
        payload: {
          user,
        },
      });
    },
    []
  );

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      // @ts-ignore
      accessToken: state.accessToken,
      method: 'jwt',
      login,
      loginPin,
      loginWithGoogle: () => {},
      loginWithGithub: () => {},
      loginWithTwitter: () => {},
      register,
      signUp,
      Signup,
      logout,
      initialize,
    }),
    // @ts-ignore
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      state.accessToken,
      login,
      loginPin,
      signUp,
      Signup,
      logout,
      register,
      initialize,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
