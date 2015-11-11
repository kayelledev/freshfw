module Shoppe
  class ImportLog < ActiveRecord::Base

    self.table_name = 'shoppe_import_logs'
    belongs_to :user, :class_name => 'Shoppe::User'
    enum import_status: [ "In progress", "Finished", "Finished with errors" ]

    validates :filename, :presence => true
    validates :user_id, :presence => true
    validates :start_time, :presence => true
    validates :import_status, :presence => true
  end
end
