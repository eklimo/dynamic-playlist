import { Box, Divider, Flex, Link, Spacer, Text } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Link as RouterLink, Outlet } from 'react-router-dom';

export default function Navbar() {
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
