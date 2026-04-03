// src/ResetPassword.jsx
import NavbarFC from './components/NavbarFC';
import FooterFC from './components/FooterFC';
import { ResetPasswordFC } from './components/ResetPasswordFC';

export function ResetPassword() {
  return (
    <>
        <NavbarFC />
        <ResetPasswordFC />
        <FooterFC />
    </>
  );
}

export default ResetPassword;