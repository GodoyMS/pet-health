import { PetDTO } from '@modules/pets/api/petsApi'
import React from 'react'
import PetListCard from './PetListCard'

const PetList = ({pets}: {pets: PetDTO[]}) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
            <PetListCard key={pet.id} pet={pet} />
        ))}
    </div>
  )
}

export default PetList