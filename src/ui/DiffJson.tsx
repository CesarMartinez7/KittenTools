import React, { useEffect, useState } from 'react'
import { diff } from 'jsondiffpatch'
import { JsonViewerLazy } from './LAZY_COMPONENT'

export default function JsonDiffViewer() {
  const [json1, setJson1] = useState('')
  const [json2, setJson2] = useState('')
  const [diffResult, setDiffResult] = useState<object | null>(null)
  const [error, setError] = useState('')

  const handleCompare = () => {
    try {
      const parsed1 = JSON.parse(json1)
      const parsed2 = JSON.parse(json2)
      const delta = diff(parsed1, parsed2)
      setDiffResult(delta)
      console.log(delta)
      setError('')
    } catch (e) {
      setError('JSON inválido 🫠')
      setDiffResult(null)
    }
  }


  useEffect(() => {
    
  }, [])

  return (
    <div className=" p-4  md:p-28 text-sm w-[1200px] mx-auto">
      {error && <p className="text-red-400 mt-2 text-center">{error}</p>}     
      <div className="grid grid-cols-2 gap-4">
        <div className='flex flex-col gap-y-2'>
        <span>Json #1</span>
        <textarea
          className="w-full h-64 p-2 border rounded bg-zinc-900 text-zinc-100"
          placeholder="JSON 1"
          value={json1}
          onChange={(e) =>  {
            handleCompare()
            setJson1(e.target.value)    
        } }
        />

        </div>
        <div className='flex flex-col gap-y-2'>
            <span>Json #2</span>
        <textarea
          className="w-full h-64 p-2 border rounded bg-zinc-900 text-zinc-100"
          placeholder="JSON 2"
          value={json2}
          onChange={(e) => {
            handleCompare()
            setJson2(e.target.value)
          }}
        />
        </div>
      </div>
      <button
        onClick={handleCompare}
        className="gradient-black-btn my-6 font-bold"
      >
        Comparar
      </button>

        <JsonViewerLazy data={diffResult} />
       
        <p className='text-zinc-400 text-xs my-4 '>Comparaciones generadas con <a  className='font-bold text-zinc-300' href='https://www.npmjs.com/package/json-diff'>json-diff-patch</a>.</p>
    </div>
  )
}
