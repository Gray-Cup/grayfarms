import Link from 'next/link'
import AddFarmForm from './AddFarmForm'

export default function NewFarmPage() {
  return (
    <>
      <div className="breadcrumb">
        <Link href="/farms">Farms</Link> / Add new
      </div>
      <h2>Add farm</h2>
      <AddFarmForm />
    </>
  )
}
