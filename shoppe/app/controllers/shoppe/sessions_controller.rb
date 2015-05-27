module Shoppe
  class SessionsController < Devise::SessionsController

    layout 'shoppe/sub'


    def destroy
      super
    end

    private

    # Overwriting the sign_out redirect path method
    def after_sign_out_path_for(resource_or_scope)
      main_app.root_path
    end
  end
end
