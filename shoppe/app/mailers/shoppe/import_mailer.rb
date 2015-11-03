module Shoppe
  class ImportMailer < ActionMailer::Base

    def imported(email, errors)
      @errors = errors
      mail :from => Shoppe.settings.outbound_email_address, :to => email, :subject => "Import products complete."
    end

  end
end
