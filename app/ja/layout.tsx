import {NextIntlClientProvider} from 'next-intl';
import {unstable_setRequestLocale, getMessages} from 'next-intl/server';

export default async function JaLayout({children}:{children: React.ReactNode}) {
  unstable_setRequestLocale('ja');
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale="ja" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
