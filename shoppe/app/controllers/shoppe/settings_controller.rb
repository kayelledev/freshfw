module Shoppe
  class SettingsController < ApplicationController
    load_and_authorize_resource  :class => 'Shoppe::SettingsController'
    before_filter { @active_nav = :settings }

    def update
      if Shoppe.settings.demo_mode?
        raise Shoppe::Error, t('shoppe.settings.demo_mode_error')
      end

      Shoppe::Setting.update_from_hash(params[:settings].permit!)
      redirect_to :settings, :notice => t('shoppe.settings.update_notice')
    end

  end
end
