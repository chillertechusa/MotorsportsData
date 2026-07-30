'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeedPost {
  id: string
  rider: string
  riderNumber: number
  action: string
  details: string
  timestamp: string
  likes: number
  liked: boolean
  bikeInfo?: string
}

const MOCK_FEED: FeedPost[] = [
  {
    id: '1',
    rider: 'Jake Martinez',
    riderNumber: 722,
    action: 'New lap time',
    details: 'Set a new personal best at Pala Raceway — 51.23s (was 52.1s)',
    timestamp: '2 hours ago',
    likes: 24,
    liked: false,
    bikeInfo: 'KTM 450SXF',
  },
  {
    id: '2',
    rider: 'Sophie Chen',
    riderNumber: 47,
    action: 'Race result',
    details: '3rd place at Hangtown (YZ85). First moto win of the season!',
    timestamp: '5 hours ago',
    likes: 18,
    liked: false,
    bikeInfo: 'Yamaha YZ85',
  },
  {
    id: '3',
    rider: 'Marcus Johnson',
    riderNumber: 119,
    action: 'Setup breakthrough',
    details: 'Switched to stiffer compression — bike turns way better in ruts',
    timestamp: '1 day ago',
    likes: 42,
    liked: false,
    bikeInfo: 'Honda CRF450R',
  },
]

export function SocialFeed() {
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_FEED)

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          }
        }
        return post
      })
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {posts.map((post) => (
        <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{post.rider}</h3>
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">#{post.riderNumber}</span>
              </div>
              <p className="text-xs text-zinc-500">{post.timestamp}</p>
            </div>
            <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </div>

          <div className="mb-3">
            <p className="text-sm font-semibold text-lime-400 mb-1">{post.action}</p>
            <p className="text-sm text-zinc-300">{post.details}</p>
            {post.bikeInfo && <p className="text-xs text-zinc-500 mt-2">Bike: {post.bikeInfo}</p>}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-lime-400 transition"
              >
                <Heart
                  className="h-4 w-4"
                  fill={post.liked ? 'currentColor' : 'none'}
                />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition">
                <MessageCircle className="h-4 w-4" />
                <span>Reply</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
