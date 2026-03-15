import React from 'react'
import { useListSpecies } from '../../hooks/useListSpecies'
import { Button, Combobox, ComboboxContent, ComboboxEmpty,ComboboxList,  ComboboxInput, ComboboxItem, ComboboxTrigger } from '@repo/ui';
const CreatePetForm = () => {
  const { data: species, isLoading: isLoadingSpecies, isError: isErrorSpecies } = useListSpecies();
  return (
    <div>
       <Combobox items={species?.map((species) => species.name)}>
          <ComboboxInput placeholder="Select species" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
    </div>
  )
}

export default CreatePetForm