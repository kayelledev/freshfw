module Shoppe
  class DashboardController < Shoppe::ApplicationController
    # load_and_authorize_resource :class => 'Shoppe::DashboardController'
    def home
      redirect_to :orders
    end
  
  end
end
