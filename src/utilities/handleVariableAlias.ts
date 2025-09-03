import { tokenExportKeyType } from '@typings/tokenExportKey'
import { tokenTypes } from '@config/tokenTypes'

import { getVariableTypeByValue } from '@utils/getVariableTypeByValue'
import { changeNotation } from '@utils/changeNotation'

async function handleVariableAlias (
  variable: Variable & { aliasSameMode?: boolean },
  value: { id: string },
  mode: { modeId: string; name: string },
  aliasSameMode = false
) {
  const resolvedAlias = await figma.variables.getVariableByIdAsync(value.id)
  const collection = await figma.variables.getVariableCollectionByIdAsync(
    resolvedAlias.variableCollectionId
  )
  const resolvedVariable = Object.values(resolvedAlias.valuesByMode)[0] as { type: string, id: string }

  // find type of the original value when resolving alias for alias
  let category: string

  if (resolvedVariable.type === 'VARIABLE_ALIAS') {
    const resolvedOriginalValue = await handleVariableAlias(variable, resolvedVariable, mode, variable.aliasSameMode || aliasSameMode)
    category = resolvedOriginalValue.category
  } else {
    category = getVariableTypeByValue(resolvedVariable)
  }

  return {
    description: variable.description || undefined,
    exportKey: tokenTypes.variables.key as tokenExportKeyType,
    category,
    values: `{${collection.name.toLowerCase()}.${changeNotation(
      resolvedAlias.name,
      '/',
      '.'
    )}}`,

    // this is being stored so we can properly update the design tokens later to account for all
    // modes when using aliases
    aliasCollectionName: collection.name.toLowerCase(),
    aliasMode: mode,
    aliasSameMode: variable.aliasSameMode || aliasSameMode
  }
}

export default handleVariableAlias
