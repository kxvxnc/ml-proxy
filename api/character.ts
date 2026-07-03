import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

interface CharacterData {
  guild: string,
  name: string,
  level: number,
  gender: 'male' | 'female',
  job: string,
  exp: string,
  quests: number,
  cards: number,
  donor: boolean,
  fame: number
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { name } = req.query;

  if (typeof name !== 'string' || !name) {
    res.status(400).json({ error: 'Name parameter is required and must be a string' });
    return;
  }

  try {
    const apiResponse = await fetch(
      `https://legends.ml/api/character?name=${encodeURIComponent(name)}`,
    );
    
    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }
    
    const data: CharacterData = await apiResponse.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};