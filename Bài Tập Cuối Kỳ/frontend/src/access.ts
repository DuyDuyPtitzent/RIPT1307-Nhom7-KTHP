export default function access(initialState: { role: string | null }) {
  const { role } = initialState || {};
  return {
    admin: role === 'admin',
  };
}