import { Helmet } from 'react-helmet-async';
// sections
import SignUp from '../../sections/auth/Signup';
// import Login from '../../sections/auth/LoginAuth0';

// ----------------------------------------------------------------------

export default function SignUpPage() {
  return (
    <>
      <Helmet>
        <title> Sign Up | POS System</title>
      </Helmet>

      <SignUp />
    </>
  );
}
