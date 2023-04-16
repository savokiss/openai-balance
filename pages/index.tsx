import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import GithubCorner from 'react-github-corner';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import dayjs from 'dayjs';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { formatBalance, balanceText, getOpenaiUsage } from '../utils';
import { storageUtils } from '../utils/storage';
import { useRows } from '../hooks/useRows';

interface TableRow {
  name: string;
  key: string;
  usage: string;
}

function updateRowUsage() {}

export default function Page() {
  const router = useRouter();
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      key: '',
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    startDate: string;
    endDate: string;
    totalUsage?: number;
  }>({
    startDate: dayjs().subtract(2, 'month').format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    totalUsage: 0,
  });
  const { rows, setRows, updateOrAddRow, updateRowName } = useRows();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRows = storageUtils.getItem<TableRow[]>('rows');
      if (storedRows) {
        setRows(storedRows);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      storageUtils.setItem('rows', rows);
    }
  }, [rows]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    // setData(null);

    const startDate =
      data?.startDate || dayjs().subtract(2, 'month').format('YYYY-MM-DD');
    const endDate = data?.endDate || dayjs().add(1, 'day').format('YYYY-MM-DD');
    router.push({ query: { ...router.query, startDate, endDate } });
    const totalUsage = await getOpenaiUsage({
      key: values.key,
      startDate,
      endDate,
    });

    setError(error || null);

    updateOrAddRow(values.key, totalUsage);

    setData({
      totalUsage: formatBalance(totalUsage),
      startDate,
      endDate,
    });
  });

  const onRefresh = async (row: TableRow) => {
    const startDate = dayjs().subtract(2, 'month').format('YYYY-MM-DD');
    const endDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const totalUsage = await getOpenaiUsage({
      startDate,
      endDate,
      key: row.key,
    });
    updateOrAddRow(row.key, totalUsage);
  };

  const onEditName = (index: number) => {
    const name = prompt('Enter your Name', rows[index].name) || 'Key';
    updateRowName(name, index);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const startDate = query.get('startDate');
    const endDate = query.get('endDate');
    startDate && endDate && setData({ startDate, endDate });
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
      <div className="max-w-2xl mx-auto p-5 py-20 relative">
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
        {
          <div>
            <div className="text-center text-xl">
              Billing From: {data.startDate} to {data.endDate}
            </div>
            <div className="text-center text-2xl font-bold pt-2">
              Total Usage: ${data.totalUsage || 0}
            </div>
          </div>
        }
        {rows && (
          <table className="min-w-full max-w-xl divide-y divide-gray-200 mt-5 absolute left-1/2 transform -translate-x-1/2">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row: TableRow, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.name}{' '}
                    <PencilSquareIcon
                      className="w-5 h-5 inline-block cursor-pointer"
                      onClick={() => onEditName(index)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    {row.usage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onRefresh(row)}
                      className="px-2 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                      <ArrowPathIcon className="w-5 h-5 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>
      <GithubCorner href="https://github.com/savokiss/openai-balance" />
    </>
  );
}
