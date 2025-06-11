const { db } = require('../lib/firebase')
const { collection, getDocs, doc, updateDoc } = require('firebase/firestore')
const { EquipmentSlot } = require('../types/equipment')

// Default equipment slots
const DEFAULT_EQUIPMENT_SLOTS = {
  helm: null,
  top: null,
  bottom: null,
  shoes: null,
  gloves: null,
  pendant: null,
  consumable: null,
  weapon: null,
  secondary: null
}

async function updateEquipmentTypes() {
  try {
    console.log('Starting equipment types update...')
    
    // Get all users
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    
    let updatedCount = 0
    let errorCount = 0
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data()
        
        // Skip if no character data
        if (!userData.character) {
          console.log(`Skipping user ${userDoc.id}: No character data`)
          continue
        }
        
        // Get current equipment
        const currentEquipment = userData.character.equipment || {}
        
        // Create updated equipment object with all slots
        const updatedEquipment = {
          ...DEFAULT_EQUIPMENT_SLOTS,
          ...currentEquipment
        }
        
        // Update user document
        await updateDoc(doc(db, 'users', userDoc.id), {
          'character.equipment': updatedEquipment
        })
        
        updatedCount++
        console.log(`Updated user ${userDoc.id}`)
      } catch (error) {
        errorCount++
        console.error(`Error updating user ${userDoc.id}:`, error)
      }
    }
    
    console.log('\nUpdate complete!')
    console.log(`Successfully updated: ${updatedCount} users`)
    console.log(`Errors encountered: ${errorCount} users`)
    
  } catch (error) {
    console.error('Error in updateEquipmentTypes:', error)
  }
}

// Run the update
updateEquipmentTypes() 