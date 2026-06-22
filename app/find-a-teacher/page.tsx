'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TeacherCard from '@/components/TeacherCard'
import { SUBJECTS, PROVINCES } from '@/lib/types'
import type { Teacher } from '@/lib/types'

const PAGE_SIZE = 20

function SearchPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    subject: params.get('subject') || '',
    city:    params.get('city')    || '',
    province:params.get('province')|| '',
    session: params.get('session') || '',
    gender:  params.get('gender')  || '',
    available: params.get('available') || '',
  })

  const search = useCallback(async (f: typeof filters, pg: number) => {
    setLoading(true)
    let q = supabase.from('teachers').select('*', { count: 'exact' })
      .eq('listing_status', 'active')
      .order('listing_tier', { ascending: false })
      .order('created_at', { ascending: false })
      .range(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE - 1)

    if (f.subject)  q = q.contains('subjects', [f.subject])
    if (f.province) q = q.ilike('province', `%${f.province}%`)
    if (f.city)     q = q.ilike('city', `%${f.city}%`)
    if (f.session)  q = q.eq('session_type', f.session)
    if (f.gender)   q = q.eq('gender', f.gender)
    if (f.available) q = q.eq('availability', true)

    const { data, count } = await q
    setTeachers((data ?? []) as Teacher[])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { search(filters, page) }, [filters, page, search])

  function set(k: string, v: string) {
    setFilters(f => ({ ...f, [k]: v }))
    setPage(0)
  }

  const FilterBox = () => (
    <div style={{ background:'#fff',border:'1.5px solid #e8e8e8',borderRadius:10,padding:24 }}>
      <h3 style={{ color:'#0F6E56',fontWeight:700,marginBottom:20,fontSize:16 }}>Filter Results</h3>
      {[
        { label:'Subject', key:'subject', type:'select', options:[{value:'',label:'All Subjects'},...SUBJECTS.filter(s=>s.value!=='other').map(s=>({value:s.value,label:s.label}))] },
        { label:'Province', key:'province', type:'select', options:[{value:'',label:'All Provinces'},...PROVINCES.map(p=>({value:p,label:p}))] },
        { label:'Session Type', key:'session', type:'select', options:[{value:'',label:'Any'},{value:'online',label:'Online'},{value:'in-person',label:'In-Person'},{value:'both',label:'Both'}] },
        { label:'Teacher Gender', key:'gender', type:'select', options:[{value:'',label:'No Preference'},{value:'male',label:'Male'},{value:'female',label:'Female'}] },
      ].map(f=>(
        <div key={f.key} style={{ marginBottom:16 }}>
          <label className="form-label">{f.label}</label>
          <select className="form-input" value={(filters as any)[f.key]} onChange={e=>set(f.key,e.target.value)}>
            {f.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      <div style={{ marginBottom:16 }}>
        <label className="form-label">City</label>
        <input className="form-input" placeholder="e.g. Cape Town" value={filters.city} onChange={e=>set('city',e.target.value)} />
      </div>
      <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:14 }}>
        <input type="checkbox" checked={!!filters.available} onChange={e=>set('available',e.target.checked?'1':'')} />
        <span>Currently taking students</span>
      </label>
      <button onClick={()=>setFilters({subject:'',city:'',province:'',session:'',gender:'',available:''})}
        style={{ marginTop:16,color:'#888',background:'none',border:'none',cursor:'pointer',fontSize:13 }}>
        Clear all filters
      </button>
    </div>
  )

  return (
    <div style={{ background:'#f9f9f9',minHeight:'100vh',paddingBottom:40, }}>
      {/* Search header */}
      <div style={{ background:'#0F6E56',padding:'32px 0' }}>
        <div className="container">
          <h1 style={{ color:'#fff',fontSize:26,fontWeight:700,margin:'0 0 16px' }}>Find an Islamic Teacher</h1>
          <form onSubmit={e=>{e.preventDefault();search(filters,0)}}
            style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
            <select className="form-input" style={{ flex:'1 1 200px',maxWidth:240 }} value={filters.subject} onChange={e=>set('subject',e.target.value)}>
              <option value="">All Subjects</option>
              {SUBJECTS.filter(s=>s.value!=='other').map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input className="form-input" placeholder="City or Province" style={{ flex:'1 1 200px',maxWidth:240 }} value={filters.city} onChange={e=>set('city',e.target.value)} />
            <button type="submit" className="btn-gold">🔍 Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding:'32px 20px' }}>
        {/* Mobile filter toggle */}
        <button className="md:hidden btn-outline" style={{ marginBottom:16,width:'100%' }} onClick={()=>setShowFilters(!showFilters)}>
          {showFilters?'Hide Filters':'Show Filters'} ⚙️
        </button>

        <div style={{ display:'grid',gridTemplateColumns:'300px 1fr',gap:28,alignItems:'start' }}>
          {/* Sidebar */}
          <div className={showFilters?'':'hidden md:block'}>
            <FilterBox />
          </div>

          {/* Results */}
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
              <p style={{ margin:0,fontSize:14,color:'#666' }}>
                {loading ? 'Searching…' : `${total} teacher${total!==1?'s':''} found`}
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign:'center',padding:60,color:'#888' }}>Loading teachers…</div>
            ) : teachers.length === 0 ? (
              <div style={{ textAlign:'center',padding:60,background:'#fff',borderRadius:10,border:'1.5px solid #e8e8e8' }}>
                <div style={{ fontSize:48,marginBottom:16 }}>🔍</div>
                <h3 style={{ color:'#0F6E56',marginBottom:8 }}>No teachers found</h3>
                <p style={{ color:'#666',marginBottom:20 }}>Try adjusting your filters or clearing the search.</p>
                <button onClick={()=>setFilters({subject:'',city:'',province:'',session:'',gender:'',available:''})} className="btn-teal">
                  Browse All Teachers
                </button>
              </div>
            ) : (
              <>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:20 }}>
                  {teachers.map(t=><TeacherCard key={t.id} teacher={t} />)}
                </div>
                {/* Pagination */}
                {total > PAGE_SIZE && (
                  <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:32 }}>
                    {page>0 && <button onClick={()=>setPage(p=>p-1)} className="btn-outline" style={{ padding:'8px 16px' }}>← Prev</button>}
                    <span style={{ padding:'8px 16px',fontSize:14,color:'#666' }}>Page {page+1} of {Math.ceil(total/PAGE_SIZE)}</span>
                    {(page+1)*PAGE_SIZE<total && <button onClick={()=>setPage(p=>p+1)} className="btn-outline" style={{ padding:'8px 16px' }}>Next →</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ textAlign:'center', padding:80, color:'#0F6E56' }}>Loading…</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
