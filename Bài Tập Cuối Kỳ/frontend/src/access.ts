export default function (initialState: { currentUser?: { role: string } }) {
  const { currentUser } = initialState || {};
  console.log('access.ts currentUser:', currentUser); // Debug
  return {
    user: currentUser && (currentUser.role === 'user' || currentUser.role === 'admin'),
    admin: currentUser && currentUser.role === 'admin',
  };
}