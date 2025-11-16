import { normalizeSql } from './normalizeSql'

/**
 * Pattern-based SQL matching for Level 2
 * Checks structure and required clauses rather than exact match
 */
export function sqlMatchesPattern(user: string, expected: string): boolean {
  const normalizedUser = normalizeSql(user)
  const normalizedExpected = normalizeSql(expected)

  // First, try exact normalized match (for simple queries)
  if (normalizedUser === normalizedExpected) {
    return true
  }

  // Pattern-based checking for complex queries

  // Check for GROUP BY pattern
  if (normalizedExpected.includes('group by')) {
    if (!normalizedUser.includes('group by')) {
      return false
    }

    // Extract GROUP BY column from expected
    const groupByMatch = normalizedExpected.match(/group by\s+(\w+)/i)
    if (groupByMatch) {
      const expectedColumn = groupByMatch[1]
      if (!normalizedUser.includes(`group by ${expectedColumn}`)) {
        return false
      }
    }

    // Check for HAVING clause if present in expected
    if (normalizedExpected.includes('having')) {
      if (!normalizedUser.includes('having')) {
        return false
      }

      // Check for COUNT, SUM, AVG, MAX, MIN if present
      const aggregateFunctions = ['count', 'sum', 'avg', 'max', 'min']
      for (const func of aggregateFunctions) {
        if (normalizedExpected.includes(func) && !normalizedUser.includes(func)) {
          return false
        }
      }

      // Check for comparison operators in HAVING
      const havingMatch = normalizedExpected.match(/having\s+([^;]+)/i)
      if (havingMatch) {
        const havingClause = havingMatch[1]
        // Check for comparison operators
        if (havingClause.includes('>') || havingClause.includes('<') || havingClause.includes('=')) {
          const hasComparison = /[><=]/.test(normalizedUser.split('having')[1] || '')
          if (!hasComparison) {
            return false
          }
        }
      }
    }

    return true
  }

  // Check for DISTINCT pattern
  if (normalizedExpected.includes('distinct')) {
    if (!normalizedUser.includes('distinct')) {
      return false
    }

    // Extract table name from expected
    const fromMatch = normalizedExpected.match(/from\s+(\w+)/i)
    if (fromMatch) {
      const expectedTable = fromMatch[1]
      if (!normalizedUser.includes(`from ${expectedTable}`)) {
        return false
      }
    }

    // Extract column name if specified
    const selectMatch = normalizedExpected.match(/select\s+distinct\s+(\w+)/i)
    if (selectMatch) {
      const expectedColumn = selectMatch[1]
      if (!normalizedUser.includes(`distinct ${expectedColumn}`) && !normalizedUser.includes(`${expectedColumn}`)) {
        return false
      }
    }

    return true
  }

  // Check for WHERE clause with comparisons
  if (normalizedExpected.includes('where')) {
    if (!normalizedUser.includes('where')) {
      return false
    }

    // Extract table name
    const fromMatch = normalizedExpected.match(/from\s+(\w+)/i)
    if (fromMatch) {
      const expectedTable = fromMatch[1]
      if (!normalizedUser.includes(`from ${expectedTable}`)) {
        return false
      }
    }

    // Check for comparison operators
    const whereMatch = normalizedExpected.match(/where\s+([^;]+)/i)
    if (whereMatch) {
      const whereClause = whereMatch[1]
      
      // Extract column name
      const columnMatch = whereClause.match(/(\w+)\s*[<>=]/)
      if (columnMatch) {
        const expectedColumn = columnMatch[1]
        if (!normalizedUser.includes(expectedColumn)) {
          return false
        }
      }

      // Check for comparison operator
      if (whereClause.includes('<') || whereClause.includes('>') || whereClause.includes('=')) {
        const hasComparison = /[><=]/.test(normalizedUser.split('where')[1] || '')
        if (!hasComparison) {
          return false
        }
      }

      // Check for date/string literals if present
      if (whereClause.includes("'")) {
        // Extract the value after comparison
        const valueMatch = whereClause.match(/[<>=]\s*'([^']+)'/)
        if (valueMatch) {
          const expectedValue = valueMatch[1]
          // Check if user query contains similar value (fuzzy match)
          if (!normalizedUser.includes(expectedValue.toLowerCase())) {
            return false
          }
        }
      }
    }

    return true
  }

  // Check for JOIN patterns
  if (normalizedExpected.includes('join')) {
    if (!normalizedUser.includes('join')) {
      return false
    }

    // Check for JOIN type (inner, left, right, etc.)
    const joinTypes = ['inner', 'left', 'right', 'full']
    for (const joinType of joinTypes) {
      if (normalizedExpected.includes(`${joinType} join`) && !normalizedUser.includes(`${joinType} join`)) {
        return false
      }
    }

    // Check for ON clause
    if (normalizedExpected.includes(' on ') && !normalizedUser.includes(' on ')) {
      return false
    }

    return true
  }

  // Check for ORDER BY pattern
  if (normalizedExpected.includes('order by')) {
    if (!normalizedUser.includes('order by')) {
      return false
    }

    // Extract ORDER BY column
    const orderByMatch = normalizedExpected.match(/order by\s+(\w+)/i)
    if (orderByMatch) {
      const expectedColumn = orderByMatch[1]
      if (!normalizedUser.includes(`order by ${expectedColumn}`)) {
        return false
      }
    }

    // Check for ASC/DESC
    if (normalizedExpected.includes(' desc') && !normalizedUser.includes(' desc')) {
      return false
    }
    if (normalizedExpected.includes(' asc') && !normalizedUser.includes(' asc')) {
      // ASC is default, so this is optional
    }

    return true
  }

  // Fallback: check if key components match
  // Extract SELECT columns
  const selectMatch = normalizedExpected.match(/select\s+([^from]+)/i)
  if (selectMatch) {
    const expectedSelect = selectMatch[1].trim()
    // Check if user has SELECT
    if (!normalizedUser.includes('select')) {
      return false
    }
  }

  // Extract FROM table
  const fromMatch = normalizedExpected.match(/from\s+(\w+)/i)
  if (fromMatch) {
    const expectedTable = fromMatch[1]
    if (!normalizedUser.includes(`from ${expectedTable}`)) {
      return false
    }
  }

  // If we get here and it's a simple query, return false (exact match already failed)
  // For complex queries, return true if basic structure matches
  return normalizedUser.includes('select') && normalizedUser.includes('from')
}

