import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import GithubCorner from 'react-github-corner';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import dayjs from 'dayjs';
import { formatBalance, requestOpenaiClient } from '../utils';

export default function Page() {
  const router = useRouter();
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      key: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ totalUsage?: number, startDate?: string, endDate?: string } | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setData(null);

    const startDate =
      data?.startDate || dayjs().subtract(2, 'month').format('YYYY-MM-DD');
    const endDate = data?.endDate || dayjs().add(1, 'day').format('YYYY-MM-DD');
    router.push({ query: { ...router.query, startDate, endDate } });
    const path = `/dashboard/billing/usage?${new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    }).toString()}`;
    const res = await requestOpenaiClient(path, values.key)(null, 'GET');
    const { total_usage } = await res.json();
    
    setError(error || null);
    setData({
      totalUsage: formatBalance(total_usage),
      startDate,
      endDate,
    });
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const startDate = query.get('startDate');
    const endDate = query.get('endDate');
    if (startDate && endDate) {
      setData({
        startDate,
        endDate,
      })
      // onSubmit()
    }
  }, []);

  return (
    <>
      <NextSeo
        title="OpenAI Balance"
        description="Fetch your OpenAI Balance in one click."
        openGraph={{
          images: [
            {
              url: 'https://download-twitter-video.egoist.dev/og.png',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <div className="max-w-xl mx-auto p-5 py-20">
        <header className="text-center">
          <h1 className="text-5xl font-bold">OpenAI Balance</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Enter your OpenAI key to fetch the balances.
          </p>
        </header>
        <form onSubmit={onSubmit} className="my-10">
          <div className="flex space-x-2">
            <input
              placeholder="Type your key here..."
              className="w-full outline-none rounded-xl h-12 px-3 bg-zinc-200 focus:ring-2 ring-indigo-400 ring-offset-2"
              {...register('key')}
            />
            <button
              className="shrink-0 px-5 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white focus:ring-2 ring-indigo-400 ring-offset-2 inline-flex items-center disabled:opacity-50"
              type="submit"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? 'Loading...' : 'Go'}
            </button>
          </div>
        </form>
        {data && (
          <div>
            <div className="text-center text-xl">
              Billing From: {data.startDate} to {data.endDate}
            </div>
            <div className="text-center text-2xl font-bold pt-2">
              Total Usage: ${data.totalUsage}
            </div>
          </div>
        )}
        {error && <div className="text-red-500 text-center">{error}</div>}
        <footer className="py-20 text-center text-zinc-500 text-sm">
          &copy; 2023{' '}
          <a
            href="https://github.com/savokiss"
            target="_blank"
            rel="nofollow noopenner"
            className=" text-blue-600 hover:underline"
          >
            savokiss
          </a>
        </footer>

        <GithubCorner href="https://github.com/savokiss/openai-balance" />
      </div>
    </>
  );
}
