import { useState, useRef } from 'react';
import { Form } from 'antd';
import { UserProfile, Account} from '@/services/types/user';

export function useProfileModel() {
  // State
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'rental' | 'management'>('profile');
  const [passwordFormAnt] = Form.useForm();
  const [extendFormAnt] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  return {
    userData, setUserData,
    allAccounts, setAllAccounts,
    loading, setLoading,
    activeTab, setActiveTab,
    passwordFormAnt,
    extendFormAnt,
    avatarPreview, setAvatarPreview,
    avatarInputRef,
    avatarKey, setAvatarKey,
    userRole, setUserRole,
  };
}