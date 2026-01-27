import { Navbar } from 'react-bootstrap';
import LoginSelectorFC from './components/LoginSelectorFC';
import './Login.css';
import NavbarFC from './components/NavbarFC';
import FooterFC from './components/FooterFC';

export function Login() {
  return (
    <>
        <NavbarFC />
        <LoginSelectorFC />
        <FooterFC />
    </>
    );
}
export default Login;