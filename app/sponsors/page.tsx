'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Heart } from 'lucide-react'
import { alipayQrCode, donors } from '@/data/sponsors'

export default function SponsorsPage() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative z-2"
    >
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/')}
        className="absolute top-5 left-5 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-md text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-orange to-neon-pink flex items-center justify-center">
          <Heart className="text-white text-2xl w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">赞赏支持</h1>
        <p className="text-sm text-gray-400 mb-6">
          如果你觉得这个项目对你有帮助，可以请我喝一杯咖啡~
        </p>

        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2">支付宝收款码</p>
          <div className="inline-block p-4 rounded-xl bg-white">
            <Image
              src={alipayQrCode}
              alt="支付宝收款码"
              width={160}
              height={160}
              className="rounded"
            />
          </div>
        </div>

        <div className="border-t border-dark-500 pt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">捐赠名单</h3>
          {donors.length === 0 ? (
            <p className="text-sm text-gray-500">暂无捐赠记录</p>
          ) : (
            <div className="space-y-3">
              {donors.map((donor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-white">
                      {donor.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-300">{donor.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-neon-green">{donor.amount}</span>
                    {donor.message && (
                      <p className="text-xs text-gray-500">{donor.message}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
