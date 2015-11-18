module Shoppe
  class AttachmentsController < Shoppe::ApplicationController
    # load_and_authorize_resource
    def destroy
      @attachment = Nifty::Attachments::Attachment.find(params[:id])
      @attachment.destroy
      respond_to do |wants|
        wants.html { redirect_to request.referer, :notice => t('shoppe.attachments.remove_notice')}
        wants.json { render :status => 'complete' }
      end
    end

  end
end
