module ApplicationHelper
  def furniture_categories
    return ['sofas', 'chairs', 'tables', 'storage', 'lighting', 'accents', 'beds']
  end

  def room_categories
    return ['livingrooms', 'bedrooms']
  end

  def form_errors_for(object=nil)
    render('shared/form_errors', object: object) unless object.blank?
  end
end
