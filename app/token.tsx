import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/shared/layout';
import { Button, Input, Text } from '@/components/shared/ui';
import { useAuthStore } from '@/store/auth';

export default function TokenScreen() {
  const { t } = useTranslation('auth');
  const rejected = useAuthStore((s) => s.rejected);
  const setToken = useAuthStore((s) => s.setToken);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>(rejected ? t('rejected') : undefined);

  const submit = () => {
    const token = value.trim();
    if (!token) return setError(t('required'));
    setToken(token);
  };

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ justifyContent: 'center' }}>
      <Text variant="title">{t('title')}</Text>
      <Text color="textMuted">{t('description')}</Text>
      <Input
        label={t('label')}
        placeholder={t('placeholder')}
        value={value}
        onChangeText={(v) => {
          setValue(v);
          setError(undefined);
        }}
        onSubmitEditing={submit}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        error={error}
      />
      <Button title={t('submit')} onPress={submit} />
    </Screen>
  );
}
