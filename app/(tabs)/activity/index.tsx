import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl } from 'react-native';

import { ActivityRow } from '@/components/screens/activity/ActivityRow';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/shared/layout';
import { Button } from '@/components/shared/ui';
import { useActivity } from '@/hooks/api/activity/useActivity';
import { errorMessageKey } from '@/helpers/api/errors';
import { makeStyles } from '@/theme';

export default function ActivityScreen() {
  const { t } = useTranslation(['activity', 'common']);
  const styles = useStyles();
  const query = useActivity();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (query.isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (query.isError && items.length === 0) {
    return (
      <Screen>
        <ErrorState message={t(errorMessageKey(query.error))} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
          />
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage && !query.isFetchNextPageError) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState title={t('empty')} />}
        ListFooterComponent={
          query.hasNextPage ? (
            <Button
              title={query.isFetchNextPageError ? t('common:actions.retry') : t('loadMore')}
              variant="ghost"
              loading={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
            />
          ) : null
        }
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  list: { paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.lg },
}));
