/**
 * Configura y muestra los controles del módulo
 * @param {string} moduleName - Nombre del módulo ("products", "movements", "inventory", "expenses")
 * @returns {void}
 */
function setupChipsFilter(moduleName) {
  // 4. Configurar chips de filtro (fijos en el layout, solo mostrar/ocultar)
  // Ocultar todos los chips primero
  const filterIn = document.getElementById("filterIn");
  const filterOut = document.getElementById("filterOut");
  const filterWarehouse = document.getElementById("filterWarehouse");
  const filterStore = document.getElementById("filterStore");
  const filterLowStock = document.getElementById("filterLowStock");
  const filterCriticalStock = document.getElementById("filterCriticalStock");

  if (filterIn) filterIn.classList.add("d-none");
  if (filterOut) filterOut.classList.add("d-none");
  if (filterWarehouse) filterWarehouse.classList.add("d-none");
  if (filterStore) filterStore.classList.add("d-none");
  if (filterLowStock) filterLowStock.classList.add("d-none");
  if (filterCriticalStock) filterCriticalStock.classList.add("d-none");

  // Remover clases active de todos los chips
  [
    filterIn,
    filterOut,
    filterWarehouse,
    filterStore,
    filterLowStock,
    filterCriticalStock,
  ].forEach((chip) => {
    if (chip) chip.classList.remove("active");
  });

  // Configurar chips según el módulo
  if (config.hasChips && config.chips.length > 0) {
    config.chips.forEach((chip) => {
      const chipElement = document.getElementById(chip.id);
      if (chipElement) {
        // Mostrar el chip
        chipElement.classList.remove("d-none");

        // Configurar onclick
        chipElement.onclick = null;
        chipElement.removeEventListener(
          "click",
          chipElement._moduleChipHandler
        );

        const chipHandler = () => {
          console.log(
            `Chip clicked: ${chip.id}, filterKey: ${chip.filterKey}, filterValue: ${chip.filterValue}`
          );
          const currentValue = getModuleState(chip.filterKey);
          console.log(`Current value: ${currentValue}`);

          if (currentValue === chip.filterValue) {
            // Desactivar filtro
            console.log("Deactivating filter");
            updateModuleState(chip.filterKey, null);
            chipElement.classList.remove("active");
          } else {
            // Activar este filtro y desactivar otros del mismo grupo
            console.log("Activating filter");
            updateModuleState(chip.filterKey, chip.filterValue);
            chipElement.classList.add("active");

            // Desactivar otros chips del mismo grupo
            config.chips.forEach((otherChip) => {
              if (
                otherChip.id !== chip.id &&
                otherChip.filterKey === chip.filterKey
              ) {
                const otherElement = document.getElementById(otherChip.id);
                if (otherElement) otherElement.classList.remove("active");
              }
            });
          }

          callModuleRender();
        };

        chipElement._moduleChipHandler = chipHandler;
        chipElement.onclick = chipHandler;
      }
    });
  }
}
