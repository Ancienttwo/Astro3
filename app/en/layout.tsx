import {NextIntlClientProvider} from 'next-intl';
import {unstable_setRequestLocale, getMessages} from 'next-intl/server';

export default async function EnLayout({children}:{children: React.ReactNode}) {
  unstable_setRequestLocale('en');
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
