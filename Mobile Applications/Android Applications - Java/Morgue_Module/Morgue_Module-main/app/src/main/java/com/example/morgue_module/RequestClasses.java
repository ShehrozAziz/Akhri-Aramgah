package com.example.morgue_module;

public class RequestClasses {
    public static class FetchMorgue{
        private String customID;
        private String password;

        public FetchMorgue(String customID, String password) {
            this.customID = customID;
            this.password = password;
        }

        // Getters and setters (if needed)
    }
    public static class ClearCabin{
        private String morgueId;
        public ClearCabin(String morgueId)
        {
            this.morgueId = morgueId;
        }
    }
    public static class SendBody{
        private String morgueName;
        private String image;
        private String morgueID;
        public  SendBody(String morgueName,String morgueID,String image)
        {
            this.morgueID = morgueID;
            this.morgueName = morgueName;
            this.image = image;
        }

    }
    public static class DeleteBody{
        private String bodyID;
        public DeleteBody(String bodyID)
        {
            this.bodyID = bodyID;
        }
    }


}
