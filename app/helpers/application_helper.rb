module ApplicationHelper
  include CurrencySelection
  #def furniture_categories
   # return ['sofas', 'chairs', 'tables', 'storage', 'lighting', 'beds']
  #end

  #def room_categories
   # return ['living-rooms', 'bedrooms', 'dining-rooms']
  #end

  def form_errors_for(object=nil)
    render('shared/form_errors', object: object) unless object.blank?
  end

  def current_currency
    cookies[:currency]
  end

  def dropdown_currency
    cookies[:currency] == 'us' ? 'ca' : 'us'
  end

  def current_currency_name
    cookies[:currency] + 'd'
  end

  def dropdown_currency_name
    (cookies[:currency] == 'us' ? 'ca' : 'us') + 'd'
  end

  def dropdown_currency_label(currency)
    currency == 'us' ? ' $USD' : ' $CAD'
  end

  def dimension_if_positive(message, field)
    "#{message}: #{field}" if field > 0
  end
end
