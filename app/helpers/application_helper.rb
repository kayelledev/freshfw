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
  
  #Added to resolve undefined 'resource' variable errors when using the sign-in form outside of Devise Controller
  def resource_name
      :user
    end

    def resource
      @user ||= User.new
    end
    def devise_mapping
      @devise_mapping ||= Devise.mappings[:user]
    end
end
