import { Box, Button, Divider, Flex, Link, Spacer, Text } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { clearAuthorization } from '../authorization';
import { useContext } from 'react';
import { AuthorizationContext } from '../AuthorizationContext';

export default function Navbar() {
  const authorizationState = useContext(AuthorizationContext);

  return (
    <>
      <Box as='nav' px='10px' py='4px'>
        <Flex align='center'>
          <Text fontSize='3xl' fontWeight='bold'>
            Dynamic Playlist
          </Text>
          <Link as={RouterLink} to='/'>Library</Link>
          <Link as={RouterLink} to='/generate'>Generate</Link>
          <Spacer />
          {authorizationState ? (
            <Button onClick={() => clearAuthorization()}>Sign out</Button>
          ) : (
            <Link href='http://localhost:8080/authorize'>Sign in</Link>
          )}
          <Spacer />
          <ColorModeSwitcher />
        </Flex>
      </Box>
      <Divider />

      <Box mx='50px' my='25px'>
        <Outlet />
      </Box>
    </>
  );
}
