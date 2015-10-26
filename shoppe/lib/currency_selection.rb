module CurrencySelection
  def currency_price(object)
    field = cookies[:currency] == 'us' ? 'cost_price' : 'price'
    object.send field
  end
end