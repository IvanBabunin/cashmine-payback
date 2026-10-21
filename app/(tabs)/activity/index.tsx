import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';

import { ActivityRow } from '@/components/screens/activity/ActivityRow';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenTitle,
} from '@/components/shared/layout';
import { Button } from '@/components/shared/ui';
import { useActivity } from '@/hooks/api/activity/useActivity';
import { errorMessageKey } from '@/helpers/api/errors';
import { makeStyles } from '@/theme';

export default function ActivityScreen() {
  const { t } = useTranslation(['activity', 'common']);
  const styles = useStyles();
  const query = useActivity();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const title = (
    <View style={styles.title}>
      <ScreenTitle title={t('title')} />
    </View>
  );

  if (query.isPending) {
    return (
      <Screen edges={['top']}>
        {title}
        <LoadingState />
      </Screen>
    );
  }
  if (query.isError && items.length === 0) {
    return (
      <Screen edges={['top']}>
        {title}
        <ErrorState message={t(errorMessageKey(query.error))} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.cell,
              index === 0 && styles.first,
              index === items.length - 1 && styles.last,
            ]}
          >
            <ActivityRow item={item} />
          </View>
        )}
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
        ListHeaderComponent={title}
        ListEmptyComponent={<EmptyState title={t('empty')} />}
        ListFooterComponent={
          query.hasNextPage ? (
            <Button
              title={query.isFetchNextPageError ? t('common:actions.retry') : t('loadMore')}
              variant="secondary"
              loading={query.isFetchingNextPage}
              onPress={() => query.fetchNextPage()}
              style={styles.more}
            />
          ) : null
        }
      />
    </Screen>
  );
}

// Rows sit in one bordered card: side borders on every cell, rounded top and bottom on the ends.
const useStyles = makeStyles((t) => ({
  list: { padding: t.spacing.lg },
  title: { paddingBottom: t.spacing.lg },
  cell: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
  },
  first: { borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg },
  last: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: t.radius.lg,
    borderBottomRightRadius: t.radius.lg,
  },
  more: { marginTop: t.spacing.md },
}));
