import { notFound } from 'next/navigation'
import { getChallenge } from '@/lib/storage'
import ChallengeClient from './ChallengeClient'

// Server component: loads challenge data before rendering
export default async function ChallengePage({ params }) {
  const challenge = await getChallenge(params.id)
  if (!challenge) notFound()

  return (
    <ChallengeClient
      challengeId={challenge.id}
      imageSrc={challenge.imageSrc}
      gridSize={challenge.gridSize}
    />
  )
}

export async function generateMetadata({ params }) {
  const challenge = await getChallenge(params.id)
  if (!challenge) return { title: 'Puzzle not found' }
  return {
    title: 'A special puzzle is waiting for you 💝',
    description: 'Someone made a love puzzle just for you. Can you solve it?',
  }
}
