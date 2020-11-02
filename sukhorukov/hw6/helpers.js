/**
 * Функция которая отмечает выбранный элемент в массиве данных для вадающего списка
 * 
 * @param {Number} taskPriority - приоритет задачи от 0 до 2
 * @returns {Array} - данные для выпадающего списка приоритета задачи с выбранным элементом 
 */
const getPrioritySelectorData = (taskPriority = 1) => {
  const priorityData = [
    {title: "низкий"},
    {title: "нормальный"},
    {title: "высокий"},
  ]
  priorityData[taskPriority].selected = true

  return priorityData
}

module.exports = getPrioritySelectorData