import { NextApiHandler, NextApiResponse } from "next"
import { NextResponse } from 'next/server'
import { requestOpenai } from '../common'

const sendError = (res: NextApiResponse, msg: string) => {
  res.status(500).send({
    error: msg,
  })
}

const handler: NextApiHandler = async (req, res) => {
  const key = req.headers.token as string | undefined

  if (!key) {
    return sendError(res, "missing key")
  }

  req.method = 'GET';

  const response = await requestOpenai(req);

  const data = await response.json();

  return res.json(data)
}

export default handler
