module Shoppe
  class ImportMailer < ActionMailer::Base

    def imported(email, errors)
      @errors = errors
      mail :from => 'karen@gofourwalls.com', :to => email, :subject => "Import products complete."
    end

  end
end
