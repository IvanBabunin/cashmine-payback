import { useTranslation } from 'react-i18next';

import { Banner, Button } from '@/components/shared/ui';

type UnresolvedClaimBannerProps = {
  amount: string;
  asset: string;
  checking: boolean;
  onCheck: () => void;
};

export function UnresolvedClaimBanner({
  amount,
  asset,
  checking,
  onCheck,
}: UnresolvedClaimBannerProps) {
  const { t } = useTranslation('home');
  return (
    <Banner
      tone="warning"
      title={t('unresolvedTitle', { amount, asset })}
      description={t('unresolvedDescription')}
      action={
        <Button
          title={t('unresolvedAction')}
          variant="secondary"
          loading={checking}
          onPress={onCheck}
        />
      }
    />
  );
}
