import Image from 'next/future/image';
import logoImg from '../../assets/logo.svg';
import { HeaderContainer } from './styles';

export function Header() {
  return (
    <HeaderContainer>
      <Image src={logoImg} alt="Ignite Shop" />
    </HeaderContainer>
  )
}
