module ApplicationHelper
  include CurrencySelection
  def furniture_categories
    return ['sofas', 'chairs', 'tables', 'storage', 'lighting', 'accents', 'beds']
  end

  def room_categories
    return ['livingrooms', 'bedrooms']
  end

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
    currency == 'us' ? 'USA($USD)' : 'Canada($CAD)'
  end

  def dimension_if_positive(message, field)
    "#{message}: #{field}" if field > 0
  end
end
