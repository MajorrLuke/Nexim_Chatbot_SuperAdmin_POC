import React from 'react';
import { FaRegTrashAlt } from "react-icons/fa";

interface HttpRequestConfigProps {
  url: string;
  setUrl: (url: string) => void;
  method: string;
  setMethod: (method: string) => void;
  body: string;
  setBody: (body: string) => void;
  headers: { [key: string]: string };
  setHeaders: (headers: { [key: string]: string }) => void;
}

const HttpRequestConfig: React.FC<HttpRequestConfigProps> = ({
  url,
  setUrl,
  method,
  setMethod,
  body,
  setBody,
  headers,
  setHeaders,
}) => {
  return (
    <div className="mt-6 bg-#fcf7ff] dark:bg-zinc-800 rounded-lg shadow-md p-2 border-zinc-300 dark:border-zinc-600 border">
      <h3 className="text-md font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Configuração de Requisição HTTP</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-light text-zinc-700 dark:text-zinc-300 mb-2">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border rounded-md border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
          />
        </div>
        <div>
          <label className="block text-sm font-light text-zinc-700 dark:text-zinc-300 mb-2">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-3 border rounded-md border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-light text-zinc-700 dark:text-zinc-300 mb-2">Request Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 border rounded-md border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-light text-zinc-700 dark:text-zinc-300 mb-2">Headers</label>
          {Object.entries(headers).map(([key, value], index) => (
            <div key={index} className="flex mt-3 gap-2 items-center">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newHeaders = { ...headers };
                  delete newHeaders[key];
                  newHeaders[e.target.value] = value;
                  setHeaders(newHeaders);
                }}
                className="w-2/5 p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
                placeholder="Chave"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
                className="w-2/5 p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition duration-150 ease-in-out"
                placeholder="Valor"
              />
              <button
                onClick={() => {
                  const newHeaders = { ...headers };
                  delete newHeaders[key];
                  setHeaders(newHeaders);
                }}
                className="w-1/6 h-10 bg-red-500 hover:bg-red-600 text-[#fcf7ff] rounded-md transition duration-150 ease-in-out focus:outline-none flex items-center justify-center"
              >
                <FaRegTrashAlt />
              </button>
            </div>
          ))}
          <button
            onClick={() => setHeaders({ ...headers, '': '' })}
            className="mt-4 px-4 w-full py-2 bg-[#54428e] text-#fcf7ff] rounded-md transition duration-150 ease-in-out"
          >
            Adicionar Cabeçalho
          </button>
        </div>
      </div>
    </div>
  );
};

export default HttpRequestConfig;