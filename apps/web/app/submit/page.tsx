import SubmitForm from '@/components/SubmitForm'

export const metadata = {
  title: 'Submit a Farm — Farms Directory',
}

export default function SubmitPage() {
  return (
    <div className="layout" style={{ display: 'block' }}>
      <SubmitForm />
    </div>
  )
}
