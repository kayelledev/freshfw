module CurrencySelection
  def currency_price(object, unit=false)
    field = cookies[:currency] == 'us' ? 'cost_price' : 'price'
    object.send unit.present? ? 'unit_' + field : field
  end
end